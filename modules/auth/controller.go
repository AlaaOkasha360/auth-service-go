package auth

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"math/big"
	"net/http"
	"time"

	"github.com/AlaaOkasha360/auth-service-go/config"
	"github.com/AlaaOkasha360/auth-service-go/helpers"
	"github.com/AlaaOkasha360/auth-service-go/modules/users"
	"github.com/AlaaOkasha360/auth-service-go/responses"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Register(ctx *gin.Context) {
	var input RegisterRequest

	if err := ctx.ShouldBindJSON(&input); err != nil {
		responses.Error(ctx, http.StatusBadRequest, err.Error())
		return
	}

	hashedPassword, err := helpers.EncryptPassword(input.Password)

	if err != nil {
		responses.Error(ctx, http.StatusInternalServerError, "Failed to process password")
		return
	}
	user := users.User{
		Name:     input.Name,
		Email:    input.Email,
		Password: hashedPassword,
	}

	if err := users.Create(&user); err != nil {
		responses.Error(ctx, http.StatusConflict, "Email already exists")
		return
	}

	responses.JSON(ctx, http.StatusCreated, "user created successfully", users.ToUserResponse(user), nil)

}

func Login(ctx *gin.Context) {
	var input LoginRequest

	if err := ctx.ShouldBindJSON(&input); err != nil {
		responses.Error(ctx, http.StatusBadRequest, err.Error())
		return
	}

	user, err := users.FindByEmail(input.Email)

	if err != nil {
		responses.Error(ctx, http.StatusNotFound, "user not found")
		return
	}

	if !helpers.ComparePassword(input.Password, user.Password) {
		responses.Error(ctx, http.StatusBadRequest, "Invalid password")
		return
	}

	tokens, err := createTokens(user)

	if err != nil {
		responses.Error(ctx, http.StatusInternalServerError, "Failed to create tokens")
		return
	}

	responses.JSON(ctx, http.StatusOK, "Login successfully", tokens, nil)
}

func Refresh(ctx *gin.Context) {
	var input RefreshTokenRequest

	if err := ctx.ShouldBindJSON(&input); err != nil {
		responses.Error(ctx, http.StatusBadRequest, err.Error())
		return
	}

	claims, err := helpers.ParseToken(input.RefreshToken, helpers.RefreshTokenType)

	if err != nil {
		responses.Error(ctx, http.StatusUnauthorized, "Invalid refresh token")
		return
	}

	var refreshToken RefreshToken

	err = config.DB.Where("token = ? AND user_id = ?", helpers.HashToken(input.RefreshToken), claims.UserID).First(&refreshToken).Error

	if err != nil || time.Now().After(refreshToken.ExpiresAt) {
		responses.Error(ctx, http.StatusUnauthorized, "Invalid refresh token")
		return
	}

	config.DB.Delete(&refreshToken)

	user, err := users.FindByID(claims.UserID)

	if err != nil {
		responses.Error(ctx, http.StatusUnauthorized, "user not found")
		return
	}

	tokens, err := createTokens(user)

	if err != nil {
		responses.Error(ctx, http.StatusInternalServerError, "Failed to create tokens")
		return
	}

	responses.JSON(ctx, http.StatusOK, "Token refreshed successfully", tokens, nil)
}

func Logout(ctx *gin.Context) {
	var input RefreshTokenRequest

	if err := ctx.ShouldBindJSON(&input); err != nil {
		responses.Error(ctx, http.StatusBadRequest, err.Error())
		return
	}

	config.DB.Where("token = ?", helpers.HashToken(input.RefreshToken)).Delete(&RefreshToken{})

	responses.JSON(ctx, http.StatusOK, "Logged out successfully", nil, nil)
}

func ForgotPassword(ctx *gin.Context) {
	var input ForgotPasswordRequest

	if err := ctx.ShouldBindJSON(&input); err != nil {
		responses.Error(ctx, http.StatusBadRequest, "Invalid data")
		return
	}

	if _, err := users.FindByEmail(input.Email); err != nil {
		responses.JSON(ctx, http.StatusOK, "If email exists a code will be sent to you!", nil, nil)
		return
	}

	c := make([]byte, 32)
	if _, err := rand.Read(c); err != nil {
		responses.Error(ctx, http.StatusInternalServerError, "Failed to create reset token")
		return
	}

	token := hex.EncodeToString(c)

	otp, err := rand.Int(rand.Reader, big.NewInt(900000))
	if err != nil {
		responses.Error(ctx, http.StatusInternalServerError, "Failed to create reset token")
		return
	}
	otpCode := uint(otp.Int64() + 100000)

	expiresAt := time.Now().Add(15 * time.Minute)
	config.DB.Where("email = ?", input.Email).Delete(&PasswordReset{})
	resetpassword := PasswordReset{
		Email:     input.Email,
		Token:     token,
		OTP:       otpCode,
		ExpiresAt: expiresAt,
	}
	if err := config.DB.Create(&resetpassword).Error; err != nil {
		responses.Error(ctx, http.StatusInternalServerError, "Failed to create reset token")
		return
	}

	log.Printf("reset token is: %v and OTP is: %v", token, otpCode)
	responses.JSON(ctx, http.StatusOK, "If email exists a code will be sent to you!", nil, nil)

}

func ResetPassword(ctx *gin.Context) {
	var input ResetPasswordRequest

	if err := ctx.ShouldBindJSON(&input); err != nil {
		responses.Error(ctx, http.StatusBadRequest, "Invalid data")
		return
	}

	var passwordReset PasswordReset

	err := config.DB.Where("token = ?", input.Token).First(&passwordReset).Error

	if err != nil {
		responses.Error(ctx, http.StatusNotFound, "no reset token found for this email")
		return
	}

	if time.Now().After(passwordReset.ExpiresAt) {
		config.DB.Delete(&passwordReset)
		responses.Error(ctx, http.StatusBadRequest, "token has been expired")
		return
	}

	if input.OTP != passwordReset.OTP {
		responses.Error(ctx, http.StatusBadRequest, "Invalid OTP")
		return
	}

	hashedPassword, err := helpers.EncryptPassword(input.NewPassword)

	if err != nil {
		responses.Error(ctx, http.StatusInternalServerError, "Failed to process password")
		return
	}

	err = config.DB.Transaction(func(tx *gorm.DB) error {
		if err := users.UpdatePassword(tx, passwordReset.Email, hashedPassword); err != nil {
			return err
		}
		return tx.Delete(&passwordReset).Error
	})

	if err != nil {
		responses.Error(ctx, http.StatusInternalServerError, "Failed to reset password")
		return
	}

	responses.JSON(ctx, http.StatusOK, "password reset successfully", nil, nil)
}

package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"math/big"
	"net/http"
	"time"

	"github.com/AlaaOkasha360/auth-service-go/config"
	"github.com/AlaaOkasha360/auth-service-go/helpers"
	"github.com/AlaaOkasha360/auth-service-go/models"
	"github.com/AlaaOkasha360/auth-service-go/requests"
	"github.com/AlaaOkasha360/auth-service-go/responses"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Register(ctx *gin.Context) {
	var input requests.RegisterRequest

	if err := ctx.ShouldBindJSON(&input); err != nil {
		responses.Error(ctx, http.StatusBadRequest, err.Error())
		return
	}

	hashedPassword, err := helpers.EncryptPassword(input.Passowrd)

	if err != nil {
		responses.Error(ctx, http.StatusInternalServerError, "Failed to process password")
		return
	}
	user := models.User{
		Name:     input.Name,
		Email:    input.Email,
		Password: string(hashedPassword),
	}

	result := config.DB.Create(&user)

	if result.Error != nil {
		responses.Error(ctx, http.StatusConflict, "Email already exists")
		return
	}

	responses.JSON(ctx, http.StatusCreated, "user created successfully", user, nil)

}

func Login(ctx *gin.Context) {
	var input requests.LoginRequest

	if err := ctx.ShouldBindJSON(&input); err != nil {
		responses.Error(ctx, http.StatusBadRequest, err.Error())
		return
	}

	var user models.User

	result := config.DB.Where("email = ?", input.Email).First(&user)

	if result.Error != nil {
		responses.Error(ctx, http.StatusNotFound, "user not found")
		return
	}

	validatePassword := helpers.ComparePassword(input.Password, user.Password)

	if validatePassword != true {
		responses.Error(ctx, http.StatusBadRequest, "Invalid password")
		return
	}

	token, err := helpers.GenerateToken(user.Email)

	if err != nil {
		responses.Error(ctx, http.StatusBadRequest, err.Error())
		return
	}

	responses.JSON(ctx, http.StatusOK, "Login successfully", token, nil)
}

func ForgotPassword(ctx *gin.Context) {
	var input requests.ForgotPassword

	if err := ctx.ShouldBindJSON(&input); err != nil {
		responses.Error(ctx, http.StatusBadRequest, "Invalid data")
		return
	}

	var user models.User

	err := config.DB.Where("email = ?", input.Email).First(&user).Error

	if err != nil {
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
	config.DB.Where("email = ?", input.Email).Delete(&models.PasswordReset{})
	resetpassword := models.PasswordReset{
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
	var input requests.ResetPassword

	if err := ctx.ShouldBindJSON(&input); err != nil {
		responses.Error(ctx, http.StatusBadRequest, "Invalid data")
		return
	}

	var passwordReset models.PasswordReset

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
		if err := tx.Model(&models.User{}).Where("email = ?", passwordReset.Email).Update("password", string(hashedPassword)).Error; err != nil {
			return err
		}
		if err := tx.Delete(&passwordReset).Error; err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		responses.Error(ctx, http.StatusInternalServerError, "Failed to reset password")
		return
	}

	responses.JSON(ctx, http.StatusOK, "password reset successfully", nil, nil)
}

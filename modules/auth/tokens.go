package auth

import (
	"time"

	"github.com/AlaaOkasha360/auth-service-go/config"
	"github.com/AlaaOkasha360/auth-service-go/helpers"
	"github.com/AlaaOkasha360/auth-service-go/modules/users"
)

func createTokens(user users.User) (TokenResponse, error) {
	accessToken, err := helpers.GenerateAccessToken(user.ID, user.Role)
	if err != nil {
		return TokenResponse{}, err
	}

	refreshToken, err := helpers.GenerateRefreshToken(user.ID)
	if err != nil {
		return TokenResponse{}, err
	}

	savedToken := RefreshToken{
		UserID:    user.ID,
		Token:     helpers.HashToken(refreshToken),
		ExpiresAt: time.Now().Add(helpers.RefreshTokenDuration),
	}

	if err := config.DB.Create(&savedToken).Error; err != nil {
		return TokenResponse{}, err
	}

	return TokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

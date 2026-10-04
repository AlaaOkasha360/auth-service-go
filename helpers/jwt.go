package helpers

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func JWTSecret() []byte {
	return []byte(os.Getenv("JWT_SECRET"))
}

func GenerateToken(email string) (string, error){
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, 
	jwt.MapClaims{
		"email": email,
		"exp": time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString(JWTSecret())

	if err != nil{
		return "", err
	}
	return tokenString, nil;
}

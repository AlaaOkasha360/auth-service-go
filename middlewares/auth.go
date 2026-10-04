package middlewares

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/AlaaOkasha360/auth-service-go/config"
	"github.com/AlaaOkasha360/auth-service-go/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)
func AuthMiddleware() gin.HandlerFunc{
	return func(ctx *gin.Context) {
		jwtSecret := os.Getenv("JWT_SECRET")
		authHeader := ctx.GetHeader("Authorization")
		if authHeader == ""{
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (any, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok{
				return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
			}
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid{
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok{
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		if float64(time.Now().Unix()) > claims["exp"].(float64){
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		var user models.User
		userEmail := claims["email"]

		if err := config.DB.Where("email = ?", userEmail).First(&user).Error; err!=nil{
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		ctx.Set("currentUser", user)

		ctx.Next()

	}
}
package middlewares

import (
	"net/http"
	"strings"

	"github.com/AlaaOkasha360/auth-service-go/config"
	"github.com/AlaaOkasha360/auth-service-go/helpers"
	"github.com/AlaaOkasha360/auth-service-go/models/users"
	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		authHeader := ctx.GetHeader("Authorization")
		if authHeader == "" {
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		claims, err := helpers.ParseToken(tokenString, helpers.AccessTokenType)
		if err != nil {
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		var user users.User
		if err := config.DB.First(&user, claims.UserID).Error; err != nil {
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		ctx.Set("currentUser", user)

		ctx.Next()
	}
}

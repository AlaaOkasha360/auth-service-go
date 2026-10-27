package middlewares

import (
	"net/http"
	"strings"

	"github.com/AlaaOkasha360/auth-service-go/helpers"
	"github.com/gin-gonic/gin"
)

const (
	UserIDKey = "userID"
	RoleKey   = "role"
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

		ctx.Set(UserIDKey, claims.UserID)
		ctx.Set(RoleKey, claims.Role)

		ctx.Next()
	}
}

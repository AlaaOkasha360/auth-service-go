package middlewares

import (
	"net/http"

	"github.com/AlaaOkasha360/auth-service-go/models/users"
	"github.com/gin-gonic/gin"
)

func UserMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		currentUser, ok := ctx.Get("currentUser")

		if !ok {
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		user, ok := currentUser.(users.User)

		if user.Role != "user" || !ok {
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		ctx.Next()
	}

}

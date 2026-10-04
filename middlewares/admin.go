package middlewares

import (
	"net/http"

	"github.com/AlaaOkasha360/auth-service-go/models"
	"github.com/gin-gonic/gin"
)

func AdminMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		currentUser, ok := ctx.Get("currentUser")

		if !ok {
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		user, ok := currentUser.(models.User)

		if user.Role != "admin" || !ok {
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		ctx.Next()
	}

}

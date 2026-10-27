package users

import (
	"net/http"

	"github.com/AlaaOkasha360/auth-service-go/helpers"
	"github.com/AlaaOkasha360/auth-service-go/middlewares"
	"github.com/AlaaOkasha360/auth-service-go/responses"
	"github.com/gin-gonic/gin"
)

func GetProfile(ctx *gin.Context) {
	user, err := FindByID(ctx.GetUint(middlewares.UserIDKey))

	if err != nil {
		responses.Error(ctx, http.StatusNotFound, "user not found")
		return
	}

	responses.JSON(ctx, http.StatusOK, "User profile retrieved successfully", ToUserResponse(user), nil)
}

func UpdateProfile(ctx *gin.Context) {
	user, err := FindByID(ctx.GetUint(middlewares.UserIDKey))

	if err != nil {
		responses.Error(ctx, http.StatusNotFound, "user not found")
		return
	}

	var input UpdateProfileRequest

	if err := ctx.ShouldBindJSON(&input); err != nil {
		responses.Error(ctx, http.StatusBadRequest, err.Error())
		return
	}

	updates := make(map[string]interface{})

	if input.Name != nil {
		updates["name"] = *input.Name
	}

	if input.Password != nil {
		hashPassword, err := helpers.EncryptPassword(*input.Password)
		if err != nil {
			responses.Error(ctx, http.StatusBadRequest, "password processsing failed")
			return
		}
		updates["password"] = hashPassword
	}

	if err := Update(&user, updates); err != nil {
		responses.Error(ctx, http.StatusInternalServerError, "update failed")
		return
	}

	user, _ = FindByID(user.ID)
	responses.JSON(ctx, http.StatusOK, "updated successfully", ToUserResponse(user), nil)

}

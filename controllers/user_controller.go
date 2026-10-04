package controllers

import (
	"net/http"

	"github.com/AlaaOkasha360/auth-service-go/config"
	"github.com/AlaaOkasha360/auth-service-go/helpers"
	"github.com/AlaaOkasha360/auth-service-go/models"
	"github.com/AlaaOkasha360/auth-service-go/requests"
	"github.com/AlaaOkasha360/auth-service-go/responses"
	"github.com/gin-gonic/gin"
)

func GetProfile(ctx *gin.Context) {
	userValue, ok := ctx.Get("currentUser")

	if !ok {
		responses.Error(ctx, http.StatusBadRequest, "unable to get the user")
		return
	}

	user, ok := userValue.(models.User)

	if !ok {
		responses.Error(ctx, http.StatusBadRequest, "failed to assert user")
		return
	}

	responses.JSON(ctx, http.StatusOK, "User profile retrieved successfully", user, nil)
}

func UpdateProfile(ctx *gin.Context) {
	userValue, ok := ctx.Get("currentUser")
	if !ok {
		responses.Error(ctx, http.StatusBadRequest, "assertion failed")
		return
	}

	user := userValue.(models.User)
	var input requests.UpdateProfile

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

	result := config.DB.Model(user).Updates(updates)
	if result.Error != nil {
		responses.Error(ctx, http.StatusInternalServerError, "update failed")
		return
	}
	config.DB.First(&user, user.ID)
	responses.JSON(ctx, http.StatusOK, "updated successfully", user, nil)

}

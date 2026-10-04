package controllers

import (
	"net/http"
	"strconv"

	"github.com/AlaaOkasha360/auth-service-go/config"
	"github.com/AlaaOkasha360/auth-service-go/models"
	"github.com/AlaaOkasha360/auth-service-go/responses"
	"github.com/gin-gonic/gin"
)

func GetAllUsers(ctx *gin.Context) {
	var users []models.User
	var page = ctx.DefaultQuery("page", "1")
	var limit = ctx.DefaultQuery("limit", "10")

	pageNum, err := strconv.Atoi(page)
	if err != nil || pageNum < 1 {
		pageNum = 1
	}

	limitNum, err := strconv.Atoi(limit)

	if err != nil || limitNum < 1 || limitNum > 100 {
		limitNum = 10
	}

	offset := (pageNum - 1) * limitNum

	query := config.DB.Model(&models.User{})

	var total int64
	query.Count(&total)

	result := query.Order("created_at DESC").Offset(offset).Limit(limitNum).Find(&users)

	if result.Error != nil {
		responses.Error(ctx, http.StatusInternalServerError, "Failed to fetch users")
		return
	}

	paginationData := map[string]int64{
		"page":        int64(pageNum),
		"limit":       int64(limitNum),
		"total":       total,
		"total_pages": (total + int64(limitNum) - 1) / int64(limitNum),
	}

	responses.JSON(ctx, http.StatusOK, "users fetched successfully", users, paginationData)

}

func DeleteUser(ctx *gin.Context) {
	userId, err := strconv.ParseUint(ctx.Param("id"), 10, 64)
	if err != nil {
		responses.Error(ctx, http.StatusBadRequest, "invalid user id")
		return
	}

	var user models.User

	if result := config.DB.First(&user, userId); result.Error != nil {
		responses.Error(ctx, http.StatusNotFound, "user not found")
		return
	}

	result := config.DB.Unscoped().Delete(&user)

	if result.Error != nil {
		responses.Error(ctx, http.StatusInternalServerError, "Failed to delete user")
		return
	}

	responses.JSON(ctx, http.StatusOK, "user deleted successfully", nil, nil)
}

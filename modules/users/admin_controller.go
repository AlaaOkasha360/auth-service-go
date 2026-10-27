package users

import (
	"net/http"
	"strconv"

	"github.com/AlaaOkasha360/auth-service-go/requests"
	"github.com/AlaaOkasha360/auth-service-go/responses"
	"github.com/gin-gonic/gin"
)

func GetAllUsers(ctx *gin.Context) {
	var query requests.PaginationQuery

	if err := ctx.ShouldBindQuery(&query); err != nil {
		responses.Error(ctx, http.StatusBadRequest, "invalid pagination query")
		return
	}

	query.Normalize()

	users, total, err := List(query)

	if err != nil {
		responses.Error(ctx, http.StatusInternalServerError, "Failed to fetch users")
		return
	}

	pagination := responses.NewPagination(query.Page, query.Limit, total)

	responses.JSON(ctx, http.StatusOK, "users fetched successfully", ToUserResponses(users), pagination)
}

func DeleteUser(ctx *gin.Context) {
	userId, err := strconv.ParseUint(ctx.Param("id"), 10, 64)
	if err != nil {
		responses.Error(ctx, http.StatusBadRequest, "invalid user id")
		return
	}

	user, err := FindByID(uint(userId))

	if err != nil {
		responses.Error(ctx, http.StatusNotFound, "user not found")
		return
	}

	if err := Delete(&user); err != nil {
		responses.Error(ctx, http.StatusInternalServerError, "Failed to delete user")
		return
	}

	responses.JSON(ctx, http.StatusOK, "user deleted successfully", nil, nil)
}

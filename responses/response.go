package responses

import (

	"github.com/gin-gonic/gin"
)

type APIResponse struct{
	Success bool `json:"success"`
	Message string `json:"message"`
	Data interface{} `json:"data,omitempty"`
	Error string `json:"error,omitempty"`
	Pagination interface{} `json:"pagination,omitempty"`
}

func JSON(ctx *gin.Context, statusCode int, message string, data interface{}, pagination interface{}){
	ctx.JSON(statusCode, APIResponse{
		Success: true,
		Message: message,
		Data: data,
		Pagination: pagination,
	})
}

func Error(ctx *gin.Context, statusCode int, message string){
	ctx.JSON(statusCode, APIResponse{
		Success: false,
		Message: message,
	})
}

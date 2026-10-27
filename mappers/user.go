package mappers

import (
	"github.com/AlaaOkasha360/auth-service-go/models/users"
	"github.com/AlaaOkasha360/auth-service-go/responses"
)

func ToUserResponse(u users.User) responses.UserResponse {
	return responses.UserResponse{
		ID:        u.ID,
		Name:      u.Name,
		Email:     u.Email,
		Role:      u.Role,
		CreatedAt: u.CreatedAt,
	}
}

func ToUserResponses(us []users.User) []responses.UserResponse {
	return MapSlice(us, ToUserResponse)
}

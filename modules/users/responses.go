package users

import (
	"time"

	"github.com/AlaaOkasha360/auth-service-go/helpers"
)

type UserResponse struct{
	ID uint `json:"id"`
	Name string `json:"name"`
	Email string `json:"email"`
	Role string `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

func ToUserResponse(u User) UserResponse {
	return UserResponse{
		ID:        u.ID,
		Name:      u.Name,
		Email:     u.Email,
		Role:      u.Role,
		CreatedAt: u.CreatedAt,
	}
}

func ToUserResponses(us []User) []UserResponse {
	return helpers.MapSlice(us, ToUserResponse)
}

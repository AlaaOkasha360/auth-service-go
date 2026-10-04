package requests

type UpdateProfile struct{
	Name *string `json:"name" binding:"omitempty,min=3,max=100"`
	Password *string `json:"password" binding:"omitempty,min=8"`
}
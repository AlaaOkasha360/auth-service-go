package users

import (
	"github.com/AlaaOkasha360/auth-service-go/config"
	"gorm.io/gorm"
)

type User struct{
	gorm.Model

	Name string `gorm:"type:varchar(255);not null;size:50" json:"name"`
	Email string `gorm:"uniqueIndex;not null;size:150" json:"email"`
	Password string `gorm:"not null" json:"-"`
	Role string `gorm:"type:varchar(20);default:'user'" json:"role"`
	
}

func UserMigrate(){
	config.DB.AutoMigrate(&User{})
}
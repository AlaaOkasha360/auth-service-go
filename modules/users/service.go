package users

import (
	"github.com/AlaaOkasha360/auth-service-go/config"
	"github.com/AlaaOkasha360/auth-service-go/requests"
	"gorm.io/gorm"
)

func FindByID(id uint) (User, error) {
	var user User
	err := config.DB.First(&user, id).Error
	return user, err
}

func FindByEmail(email string) (User, error) {
	var user User
	err := config.DB.Where("email = ?", email).First(&user).Error
	return user, err
}

func Create(user *User) error {
	return config.DB.Create(user).Error
}

func Update(user *User, updates map[string]interface{}) error {
	return config.DB.Model(user).Updates(updates).Error
}

func UpdatePassword(db *gorm.DB, email string, hashedPassword string) error {
	return db.Model(&User{}).Where("email = ?", email).Update("password", hashedPassword).Error
}

func Delete(user *User) error {
	return config.DB.Unscoped().Delete(user).Error
}

func List(query requests.PaginationQuery) ([]User, int64, error) {
	var users []User
	var total int64

	if err := config.DB.Model(&User{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := config.DB.Order("created_at DESC").Offset(query.Offset()).Limit(query.Limit).Find(&users).Error

	return users, total, err
}

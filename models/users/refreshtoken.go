package users

import (
	"time"

	"github.com/AlaaOkasha360/auth-service-go/config"
)

type RefreshToken struct {
	ID        uint      `gorm:"primaryKey"`
	UserID    uint      `gorm:"not null;index"`
	Token     string    `gorm:"uniqueIndex;not null"`
	ExpiresAt time.Time `gorm:"not null"`
	CreatedAt time.Time
}

func RefreshTokenMigrate() {
	config.DB.AutoMigrate(&RefreshToken{})
}

package models

import "time"

type PasswordReset struct{
	ID uint `gorm:"primaryKey"`
	Email string `gorm:"not null"`
	Token string `gorm:"uniqueIndex;not null"`
	OTP uint `gorm:"not null"`
	ExpiresAt time.Time `gorm:"not null"`
}
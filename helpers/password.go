package helpers

import "golang.org/x/crypto/bcrypt"

func EncryptPassword(password string) (string, error){
	hashedpassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	return string(hashedpassword), err
}

func ComparePassword(password string, hash string) bool{
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

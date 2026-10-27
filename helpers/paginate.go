package helpers

import (
	"github.com/AlaaOkasha360/auth-service-go/requests"
	"gorm.io/gorm"
)

func Paginate[T any](query *gorm.DB, q requests.PaginationQuery){

}
package requests

type PaginationQuery struct{
	Page int `form:"page"`
	Limit int `form:"limit"`
}

func (q *PaginationQuery) Normalize(){
	if q.Page < 1{
		q.Page = 1
	}
	if q.Limit<1 || q.Limit>100{
		q.Limit=10
	}
}

func (q PaginationQuery) Offset() int{
	return (q.Page-1)*q.Limit
}
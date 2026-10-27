package responses

type Pagination struct{
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

func NewPagination(page, limit int, total int64) Pagination{
	totalPages := 0

	if total > 0{
		totalPages = int((total + int64(limit)-1)/int64(limit))
	}
	return Pagination{
		Page: page,
		Limit: limit,
		Total: total,
		TotalPages: totalPages,
	}
}
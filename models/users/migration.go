package users

func MigrateAllTables(){
	UserMigrate()
	PasswordresetMigrate()
}
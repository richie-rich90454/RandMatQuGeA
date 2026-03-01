package main

import(
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main(){
	app:=fiber.New(fiber.Config{
		AppName: "RandMatQuGe",
	})
	app.Use(logger.New())
	app.Use(recover.New())
	distPath, err:=filepath.Abs("./dist")
	if err!=nil{
		log.Fatalf("Failed to resolve dist path: %v", err)
	}
	if _, err:=os.Stat(distPath); os.IsNotExist(err){
		log.Fatalf("Dist folder not found at %s. Did you run 'npm run build'?", distPath)
	}
	app.Use("/", func(c *fiber.Ctx) error{
		requestPath:=c.Path()
		fullPath:=filepath.Join(distPath, requestPath)
		if info, err:=os.Stat(fullPath); err==nil&&!info.IsDir(){
			ext:=strings.ToLower(filepath.Ext(fullPath))
			switch ext{
			case ".html", ".css", ".js", ".ts", ".map":
				c.Set("Cache-Control", "no-cache, no-store, must-revalidate")
			case ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico",
				".mp4", ".webm", ".ogg",
				".woff", ".woff2", ".ttf", ".eot":
				c.Set("Cache-Control", "public, max-age=31536000, immutable")
			default:
				c.Set("Cache-Control", "no-cache")
			}
			return c.SendFile(fullPath)
		}
		return c.Next()
	})
	app.Use("*", func(c *fiber.Ctx) error{
		if strings.HasPrefix(c.Path(), "/api"){
			return c.Next()
		}
		c.Set("Cache-Control", "no-cache, no-store, must-revalidate")
		return c.SendFile(filepath.Join(distPath, "index.html"))
	})
	port:=os.Getenv("PORT")
	if port==""{
		port="1331"
	}
	log.Printf("Server starting on http://localhost:%s", port)
	log.Fatal(app.Listen(":"+port))
}
package main

import (
	"flag"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/qjpcpu/log"
	"github.com/qjpcpu/magicbox/server/conf"
	"github.com/qjpcpu/magicbox/server/ctrls"
	"path/filepath"
)

var config_file string

func main() {
	flag.StringVar(&config_file, "c", "", "config file")
	flag.Parse()
	if config_file == "" {
		fmt.Println("no config file")
		return
	}
	cfg := conf.Get()
	conf.LoadJson(config_file, cfg)
	// init log
	log.InitLog(log.LogOption{
		LogFile: filepath.Join(cfg.LogDir, "server.log"),
		Level:   log.DEBUG,
		Format:  "%{level}: [%{time:2006-01-02 15:04:05.000}][%{shortfile}][%{message}]",
	})
	cfg.InitEthClients()
	conf.InitNonceManager(cfg.Redisconn, cfg.RedisDb, cfg.RedisPwd, conf.EthConn())
	router := gin.Default()
	router.Use(ctrls.AllowCORS)

	router.GET("/tx/pending", ctrls.GetPendingTx)

	router.Run(conf.Get().Listen)
}

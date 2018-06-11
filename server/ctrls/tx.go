package ctrls

import (
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/qjpcpu/ethereum/etherscan"
	"github.com/qjpcpu/log"
	"github.com/qjpcpu/magicbox/server/conf"
	"net/http"
)

func AllowCORS(c *gin.Context) {
	from := c.Request.Header.Get("Origin")
	if from != "" {
		c.Writer.Header().Set("Access-Control-Allow-Origin", from)
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT,PATCH")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusOK)
		}
	}
}

func GetPendingTx(c *gin.Context) {
	var err error
	var pendings []string
	owner := c.Query("address")
	for loop := true; loop; loop = false {
		if owner == "" {
			err = errors.New("no address")
			break
		}
		pendings, err = etherscan.PendingTxs(conf.EtherscanEnv, owner)
	}
	if err != nil {
		log.Errorf("get pending tx fail:%v", err)
		c.JSON(http.StatusOK, gin.H{"code": 1, "msg": err.Error()})
	} else {
		if len(pendings) == 0 {
			// make sure return empty array nor null
			pendings = make([]string, 0)
		}
		c.JSON(http.StatusOK, gin.H{"code": 0, "txs": pendings})
	}
}

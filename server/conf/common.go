package conf

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/qjpcpu/ethereum/etherscan"
	"github.com/qjpcpu/ethereum/ethnonce"
	"github.com/qjpcpu/ethereum/ethnonce/iredis"
	"io/ioutil"
	"math/big"
	"os"
	"strings"
	"time"
)

const (
	TIME_LAYOUT = "2006-01-02 15:04:05"
	DATE_LAYOUT = "2006-01-02"
)

const (
	GasPrice_1gwei  uint64 = 1000000000  // 1gwei
	GasPrice_10gwei uint64 = 10000000000 // 10gwei
)

var (
	config       Configuration
	conn         *ethclient.Client
	nonceMgr     *ethnonce.NonceManager
	Beijing, _   = time.LoadLocation("Asia/Shanghai")
	EtherscanEnv etherscan.Env
)

type Configuration struct {
	Redisconn   string
	RedisDb     string
	LogDir      string
	RedisPwd    string
	EthNodePath string
	Listen      string
}

// obj must be pointer
func LoadJson(config_file string, obj interface{}) error {
	file, err := os.Open(config_file)
	if err != nil {
		return err
	}
	defer file.Close()

	config_str, err := ioutil.ReadAll(file)
	if err != nil {
		return err
	}
	return json.Unmarshal(config_str, obj)
}

func (cfg *Configuration) InitEthClients() error {
	var err error
	conn, err = ethclient.Dial(cfg.EthNodePath)
	if err != nil {
		return err
	}
	if strings.Contains(cfg.EthNodePath, "ropsten") {
		EtherscanEnv = etherscan.Ropsten
	} else {
		EtherscanEnv = etherscan.Online
	}
	fmt.Println("connect to ", cfg.EthNodePath)
	return nil
}

func EthConn() *ethclient.Client {
	return conn
}

func Get() *Configuration {
	return &config
}

func InitNonceManager(con_str, db, pwd string, ec *ethclient.Client) {
	nonceMgr = iredis.PrepareRedisManager("magicbox:hash:nonce", con_str, db, pwd).SetEthClient(ec).Build()
}

func GetNonceManager() *ethnonce.NonceManager {
	return nonceMgr
}

func AsEth(num *big.Int) float64 {
	one_eth := big.NewFloat(1000000000000000000)
	f, _ := new(big.Float).Quo(new(big.Float).SetInt(num), one_eth).Float64()
	return f
}

func GasPrice() uint64 {
	gp, err := conn.SuggestGasPrice(context.Background())
	if err != nil {
		return GasPrice_10gwei * 2
	}
	return gp.Uint64()
}

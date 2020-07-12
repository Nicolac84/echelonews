set -e

# Setup environment
echo "Setting up environment variables"
export POSTGRES_URI="postgres://postgres:$(pass os/postgres)@localhost/test"
export AMQP_BROKER="amqp://localhost"
export JWT_SECRET='someverylongandextremelyrandomstring'
export API_URL='http://localhost:8081'
export USER_HANDLER_URL='http://localhost:8082'
export OAUTH_BRIDGE_URL='http://localhost:8083'
export ORGANIZER_URL='http://localhost:8084'
export GOOGLE_CLIENT_ID='638708843877-frvomvhe70864v8cu1u8bmqvmeeip2vt.apps.googleusercontent.com'
export GOOGLE_CLIENT_SECRET='iOkFljouiP8rX4OVD_vTyvvO'
export GOOGLE_TRANSLATE_API_KEY='AIzaSyBWfMCfnzXuauapUHitVUQCWZa6Yr2dJLU'

# Setup local log transporter
LOGDIR='/tmp/echelonews-log'
mkdir $LOGDIR

# Setup PIDs array
SRV_PIDS=()

# Start User Handler
echo "Starting User Handler"
SERVICE=user-handler PORT=8082 npm start > $LOGDIR/user-handler.log &
SRV_PIDS+=("$!")

# Start OAuth bridge
echo "Starting OAuth bridge"
SERVICE=oauth-bridge PORT=8083 npm start > $LOGDIR/oauth-bridge.log &
SRV_PIDS+=("$!")

# Start News Multiplexer
echo "Starting News Multiplexer"
SERVICE=news-multiplexer npm start > $LOGDIR/news-multiplexer.log &
SRV_PIDS+=("$!")

# Start API
echo "Starting API"
SERVICE=api PORT=8081 npm start > $LOGDIR/api.log &
SRV_PIDS+=("$!")

# Start News Organizer
echo "Starting News Organizer"
SERVICE=news-organizer PORT=8084 npm start > $LOGDIR/news-organizer.log &
SRV_PIDS+=("$!")

# Start News Fetcher
echo "Starting News Fetcher"
SERVICE=news-fetcher npm start > $LOGDIR/news-fetcher.log &
SRV_PIDS+=("$!")

# Start Web Frontend
echo "Starting Web Frontend"
npm run frontend > $LOGDIR/frontend.log &
SRV_PIDS+=("$!")


# Tail all logs
for srv in user-handler oauth-bridge news-multiplexer news-fetcher news-organizer api frontend; do
  alacritty -t "Log: $srv" -e tail -f $LOGDIR/$srv.log &
  SRV_PIDS+=("$!")
done

set +e

# Wait for SIGINT, when happens shut down everything
function cleanup {
  for pid in ${SRV_PIDS[@]}; do kill -2 $pid; done
  rm -r $LOGDIR
  exit 0
}
trap cleanup SIGINT
while true; do sleep 1000; done

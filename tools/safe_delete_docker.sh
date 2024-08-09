# Stop all running containers
docker stop $(docker ps -q)

# Remove all containers
docker rm $(docker ps -a -q)

# Remove all images
docker rmi -f $(docker images -q)

# Remove all networks
docker network rm $(docker network ls -q)

# Remove all volumes
docker volume rm $(docker volume ls -q)

# Alternatively, use prune to clean up everything
docker system prune -a --volumes


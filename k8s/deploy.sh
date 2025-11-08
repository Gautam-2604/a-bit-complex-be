# Create kind cluster first (skip if already exists)
kind create cluster --name complex-be --config=clusters.yaml || echo "Cluster already exists"

# Build the image from the parent directory
cd ..
docker build -t gautamgaurisaria/complex-be:latest .
echo "✅ Image built successfully"

# Verify image exists locally
docker images | grep gautamgaurisaria/complex-be

cd k8s

# Load image into kind cluster (specify cluster name)
kind load docker-image gautamgaurisaria/complex-be:latest --name complex-be
echo "✅ Image loaded into cluster"

# Verify image is in cluster
docker exec -it complex-be-control-plane crictl images | grep gautamgaurisaria/complex-be || echo "❌ Image not found in cluster"

# Deploy all services
kubectl apply -f postgres.yaml
kubectl apply -f backend.yaml  
kubectl apply -f nginx.yaml

# Check status
kubectl get pods
kubectl get services

# Access the application
# For kind cluster: http://localhost:30080
# For minikube: minikube service nginx-service --url

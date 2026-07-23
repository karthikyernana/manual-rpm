#!/bin/bash

# Setup script to help create .env files
# Usage: ./setup-env.sh

echo "🚀 Manual-RPM Environment Setup"
echo "==============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "backend/package.json" ] || [ ! -f "frontend/package.json" ]; then
  echo -e "${RED}❌ Error: This script must be run from the root directory${NC}"
  echo "   Run: cd /path/to/manual-rpm && ./setup-env.sh"
  exit 1
fi

# Function to create backend .env
setup_backend_env() {
  echo -e "${BLUE}Setting up backend/.env${NC}"
  echo ""
  
  if [ -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  backend/.env already exists${NC}"
    read -p "Overwrite? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo "Skipped backend/.env"
      return
    fi
  fi
  
  read -p "Enter MongoDB URI (starts with mongodb+srv://): " mongodb_uri
  
  if [ -z "$mongodb_uri" ]; then
    echo -e "${RED}❌ MongoDB URI cannot be empty${NC}"
    return 1
  fi
  
  if [[ ! $mongodb_uri =~ ^mongodb ]]; then
    echo -e "${RED}❌ Invalid MongoDB URI format (must start with mongodb)${NC}"
    return 1
  fi
  
  # Generate JWT_SECRET if not provided
  echo ""
  echo "JWT_SECRET can be:"
  echo "1. Auto-generated (recommended) - press Enter"
  echo "2. Custom - enter your 32+ character secret"
  read -p "Enter JWT_SECRET (or press Enter to auto-generate): " jwt_secret
  
  if [ -z "$jwt_secret" ]; then
    jwt_secret=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" 2>/dev/null)
    if [ -z "$jwt_secret" ]; then
      echo -e "${RED}❌ Could not generate JWT_SECRET. Node.js not installed?${NC}"
      return 1
    fi
    echo -e "${GREEN}✓ Auto-generated JWT_SECRET: ${jwt_secret}${NC}"
  fi
  
  if [ ${#jwt_secret} -lt 32 ]; then
    echo -e "${RED}❌ JWT_SECRET must be at least 32 characters (yours: ${#jwt_secret})${NC}"
    return 1
  fi
  
  # Create .env file
  cat > backend/.env << EOF
MONGODB_URI=${mongodb_uri}
JWT_SECRET=${jwt_secret}
JWT_EXPIRY=1h
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM="Manual-RPM Notifications" <your-email@gmail.com>
EOF
  
  echo -e "${GREEN}✓ Created backend/.env${NC}"
  echo ""
}

# Function to create frontend .env
setup_frontend_env() {
  echo -e "${BLUE}Setting up frontend/.env${NC}"
  echo ""
  
  if [ -f "frontend/.env" ]; then
    echo -e "${YELLOW}⚠️  frontend/.env already exists${NC}"
    read -p "Overwrite? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo "Skipped frontend/.env"
      return
    fi
  fi
  
  read -p "Enter Backend API URL (default: http://localhost:5001/api/v1): " api_url
  
  if [ -z "$api_url" ]; then
    api_url="http://localhost:5001/api/v1"
  fi
  
  cat > frontend/.env << EOF
VITE_API_BASE_URL=${api_url}
EOF
  
  echo -e "${GREEN}✓ Created frontend/.env${NC}"
  echo ""
}

# Main execution
echo -e "${YELLOW}This script will help you set up .env files${NC}"
echo "You'll need:"
echo "  • MongoDB Atlas connection string"
echo "  • Knowledge of where frontend/backend are running"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Setup cancelled"
  exit 0
fi

echo ""

# Setup both environments
setup_backend_env || exit 1
setup_frontend_env || exit 1

# Summary
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Install backend dependencies:   cd backend && npm install"
echo "2. Install frontend dependencies:  cd frontend && npm install"
echo "3. Start backend:                  npm run dev  (in backend folder)"
echo "4. Start frontend:                 npm run dev  (in frontend folder)"
echo "5. Open browser:                   http://localhost:5173"
echo "6. Login with:                     admin@manual-rpm.com / Admin@123"
echo ""
echo -e "${YELLOW}If you get 401 errors, check:${NC}"
echo "  • MongoDB URI is correct and accessible"
echo "  • JWT_SECRET is 32+ characters"
echo "  • Both servers are running"
echo "  • Browser localStorage is cleared"
echo ""
echo "For detailed help, see: FRIEND_SETUP_GUIDE.md"


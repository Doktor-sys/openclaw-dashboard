FROM nginx:alpine

# Copy simple nginx configuration
COPY nginx-simple.conf /etc/nginx/nginx.conf

# Copy static HTML file directly
COPY index.html /usr/share/nginx/html/

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

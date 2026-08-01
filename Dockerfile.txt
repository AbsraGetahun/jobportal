FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip nginx

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Create directories
RUN mkdir -p /var/www/html/bootstrap/cache /var/www/html/storage /var/www/html/storage/framework /var/www/html/storage/logs && \
    chmod -R 777 /var/www/html/bootstrap /var/www/html/storage

# Copy application
COPY jobportal-backend/ .

# Copy SSL certificate
COPY jobportal-backend/ca.pem /var/www/html/ca.pem

# Create .env from example
RUN cp .env.example .env && \
    sed -i "s|APP_ENV=.*|APP_ENV=production|" .env && \
    sed -i "s|APP_DEBUG=.*|APP_DEBUG=false|" .env && \
    sed -i "s|APP_URL=.*|APP_URL=https://job-portal-api-wifg.onrender.com|" .env && \
    sed -i "s|DB_CONNECTION=.*|DB_CONNECTION=mysql|" .env && \
    sed -i "s|DB_HOST=.*|DB_HOST=mysql-2cada97c-absra-jobportal.e.aivencloud.com|" .env && \
    sed -i "s|DB_PORT=.*|DB_PORT=26003|" .env && \
    sed -i "s|DB_DATABASE=.*|DB_DATABASE=defaultdb|" .env && \
    sed -i "s|DB_USERNAME=.*|DB_USERNAME=avnadmin|" .env && \
    sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=${DB_PASSWORD}|" .env && \
    echo "DB_SSL_CA=/var/www/html/ca.pem" >> .env

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Generate key and clear cache
RUN php artisan key:generate && \
    php artisan config:clear && \
    php artisan cache:clear && \
    php artisan view:clear

# Permissions
RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache

# Nginx config
RUN echo 'server { listen 8080; root /var/www/html/public; index index.php; location / { try_files $uri $uri/ /index.php?$query_string; } location ~ \.php$ { fastcgi_pass 127.0.0.1:9000; fastcgi_index index.php; fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; include fastcgi_params; } }' > /etc/nginx/sites-enabled/default

EXPOSE 8080
CMD ["sh", "-c", "php artisan serve --host=0.0.0.0 --port=8080"]
FROM php:8.2-fpm

RUN apt-get update && apt-get install -y git curl libpng-dev libonig-dev libxml2-dev zip unzip nginx

RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

RUN mkdir -p /var/www/html/bootstrap/cache /var/www/html/storage /var/www/html/storage/framework /var/www/html/storage/logs && chmod -R 777 /var/www/html/bootstrap /var/www/html/storage

COPY jobportal-backend/ .

COPY jobportal-backend/ca.pem /var/www/html/ca.pem

RUN echo "APP_ENV=production" > /var/www/html/.env && \
    echo "APP_DEBUG=false" >> /var/www/html/.env && \
    echo "APP_URL=https://jobportal-y56o.onrender.com" >> /var/www/html/.env && \
    echo "DB_CONNECTION=mysql" >> /var/www/html/.env && \
    echo "DB_HOST=mysql-2cada97c-absra-jobportal.e.aivencloud.com" >> /var/www/html/.env && \
    echo "DB_PORT=26003" >> /var/www/html/.env && \
    echo "DB_DATABASE=defaultdb" >> /var/www/html/.env && \
    echo "DB_USERNAME=avnadmin" >> /var/www/html/.env && \
    echo "DB_PASSWORD=${DB_PASSWORD}" >> /var/www/html/.env && \
    echo "DB_SSL_CA=/var/www/html/ca.pem" >> /var/www/html/.env && \
    echo "CACHE_STORE=file" >> /var/www/html/.env && \
    echo "SESSION_DRIVER=file" >> /var/www/html/.env

RUN composer install --no-dev --optimize-autoloader

RUN php artisan key:generate

RUN chown -R www-data:www-data /var/www/html && chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache

RUN echo 'server { listen 8080; root /var/www/html/public; index index.php; location / { try_files $uri $uri/ /index.php?$query_string; } location ~ \.php$ { fastcgi_pass 127.0.0.1:9000; fastcgi_index index.php; fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; include fastcgi_params; } }' > /etc/nginx/sites-enabled/default

EXPOSE 8080

CMD ["sh", "-c", "php artisan config:clear && php artisan cache:clear && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8080"]
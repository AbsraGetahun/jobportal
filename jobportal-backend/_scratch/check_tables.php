<?php
try {
  $pdo = new PDO('sqlite:'.__DIR__.'/database/database.sqlite');
  $t = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  foreach ($t->fetchAll(PDO::FETCH_COLUMN) as $n) { echo $n.PHP_EOL; }
} catch (Throwable $e) { echo 'ERR: '.$e->getMessage().PHP_EOL; }

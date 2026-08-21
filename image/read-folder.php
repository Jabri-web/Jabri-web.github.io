<?php
header('Content-Type: application/json');
header('Cache-Control: no-cache, must-revalidate');

$dir = __DIR__;
$files = array_diff(scandir($dir), ['.', '..', 'read-folder.php']);

$images = [];
$audios = [];
$videos = [];

$imageExt = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico'];
$audioExt = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'];
$videoExt = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'm4v', '3gp'];

foreach ($files as $file) {
    if (is_dir($dir . '/' . $file)) continue;
    if ($file[0] === '.') continue;
    
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    
    if (in_array($ext, $imageExt)) {
        $images[] = $file;
    } elseif (in_array($ext, $audioExt)) {
        $audios[] = $file;
    } elseif (in_array($ext, $videoExt)) {
        $videos[] = $file;
    }
}

echo json_encode([
    'images' => $images,
    'audios' => $audios,
    'videos' => $videos,
    'total' => count($images) + count($audios) + count($videos)
]);
?>
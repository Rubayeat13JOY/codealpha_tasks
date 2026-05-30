<?php
$page_title = "Home";
$page_active = "home";
include 'base.php';
include 'db.php';

$is_logged_in = isset($_SESSION['user_id']);
$placeholder = "images/placeholder.png";

// Fetch 20 random recommended products
$rec_result = $conn->query("SELECT id, name, main_image FROM products ORDER BY RAND() LIMIT 20");
$recommended = [];
if($rec_result && $rec_result->num_rows > 0){
    while($row = $rec_result->fetch_assoc()){
        $recommended[] = $row;
    }
}
?>

<!-- ================= BANNER ================= -->
<section class="banner">
    <div class="banner-left">
        <img src="images/font.png" alt="Discover Compare Shop" />
    </div>

    <div class="banner-slider">
        <div class="slides">
            <img src="images/slider_1.png" class="active" />
            <img src="images/slider_2.png" />
            <img src="images/slider_3.png" />
        </div>
        <button class="prev">&#10094;</button>
        <button class="next">&#10095;</button>
    </div>

    <div class="banner-right">
        <img src="images/top_1.png" />
        <img src="images/top_2.png" />
    </div>
</section>

<!-- ============== RECOMMENDED ============== -->
<section class="recommended">
    <h2>Recommended for you</h2>
    <div class="rec-container">
        <button class="rec-prev">&#10094;</button>
        <div class="rec-slider">
            <div class="rec-items">
                <?php foreach($recommended as $prod):
                    // Use placeholder if main_image missing or file does not exist
                    $img_path = (!isset($prod['main_image']) || trim($prod['main_image']) === '') ? $placeholder : $prod['main_image'];
                    if(!file_exists($img_path)) $img_path = $placeholder;

                    $href = $is_logged_in ? "product.php?id={$prod['id']}" : "#";
                    $loginClass = $is_logged_in ? '' : 'login-popup';
                ?>
                    <div class="rec-item" data-href="<?= $href ?>" data-login="<?= $loginClass ? '1' : '0' ?>">
                        <img src="<?= $img_path ?>" alt="<?= htmlspecialchars($prod['name']) ?>">
                        <p><?= htmlspecialchars($prod['name']) ?></p>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
        <button class="rec-next">&#10095;</button>
    </div>
</section>

<!-- ============ WHY CHOOSE US ============ -->
<section class="why-choose">
    <h2>Why Choose Us?</h2>
    <div class="choose-icons">
        <div class="icon-box">
            <img src="images/quality.png" />
            <p>best quality</p>
        </div>
        <div class="icon-box">
            <img src="images/secure.png" />
            <p>secure payment</p>
        </div>
        <div class="icon-box">
            <img src="images/delivery.png" />
            <p>fast delivery</p>
        </div>
        <div class="icon-box">
            <img src="images/support.png" />
            <p>24/7 support</p>
        </div>
    </div>
</section>

<?php include 'base_footer.php'; ?>

<!-- Embed popup.php -->
<div id="popup-placeholder">
    <?php include 'popup.php'; ?>
</div>

<link rel="stylesheet" href="style.css">

<script>
document.addEventListener('DOMContentLoaded', function(){

    const isLoggedIn = <?= $is_logged_in ? 'true' : 'false' ?>;

    // ---------------- Banner Slider ----------------
    let currentSlide = 0;
    const slides = document.querySelectorAll(".banner-slider img");
    const nextBtn = document.querySelector(".banner-slider .next");
    const prevBtn = document.querySelector(".banner-slider .prev");

    function showSlide(index){ slides.forEach((s,i)=>s.classList.toggle("active",i===index)); }

    if(slides.length && nextBtn && prevBtn){
        nextBtn.addEventListener("click",()=>{ currentSlide=(currentSlide+1)%slides.length; showSlide(currentSlide); });
        prevBtn.addEventListener("click",()=>{ currentSlide=(currentSlide-1+slides.length)%slides.length; showSlide(currentSlide); });
        setInterval(()=>{ currentSlide=(currentSlide+1)%slides.length; showSlide(currentSlide); },4000);
    }

    // Banner click
    slides.forEach(slide=>{
        slide.style.cursor = 'pointer';
        slide.addEventListener('click', ()=>{
            if(isLoggedIn){
                window.location.href = 'offer.php';
            } else {
                const popup = document.getElementById('login-popup');
                if(popup) popup.style.display = 'flex';
            }
        });
    });

    // ---------------- Recommended Slider ----------------
    const recItems = document.querySelector(".rec-items");
    const recPrev = document.querySelector(".rec-prev");
    const recNext = document.querySelector(".rec-next");
    let recIndex = 0;
    if(recItems && recPrev && recNext){
        const itemWidth = recItems.children[0].offsetWidth + 20; // card width + margin
        recNext.addEventListener("click",()=>{ recIndex=Math.min(recIndex+1, recItems.children.length-4); recItems.style.transform=`translateX(-${recIndex*itemWidth}px)`; });
        recPrev.addEventListener("click",()=>{ recIndex=Math.max(recIndex-1,0); recItems.style.transform=`translateX(-${recIndex*itemWidth}px)`; });
    }

    // Recommended product click
    document.querySelectorAll('.rec-item').forEach(item=>{
        item.addEventListener('click', e=>{
            e.preventDefault();
            const loginPopup = item.getAttribute('data-login') === '1';
            const href = item.getAttribute('data-href');

            if(loginPopup){
                const popup = document.getElementById('login-popup');
                if(popup) popup.style.display = 'flex';
            } else if(href){
                window.location.href = href;
            }
        });

        // JS fallback for broken images
        const img = item.querySelector('img');
        img.onerror = function(){ this.src='images/placeholder.png'; }
    });

});
</script>

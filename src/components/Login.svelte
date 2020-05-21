<script>
  import News from "./News.svelte";
  import Footer from "./Footer.svelte";
  import Header from "./Header.svelte";
  import HeroSlider from "./HeroSlider.svelte";
  import PushyPanel from "./PushyPanel.svelte";
  import ModalLogin from "./ModalLogin.svelte";
</script>

<div class="site-wrapper clearfix">
  <div class="site-overlay" />
  <div id="root">
    <div id="home">
      <Header />
      <PushyPanel />
      <HeroSlider />
      <News />
      <Footer />
    </div>
  </div>
</div>

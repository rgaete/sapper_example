<script>
  import News from "../components/News.svelte";
  import Footer from "../components/Footer.svelte";
  import Header from "../components/Header.svelte";
  import HeroSlider from "../components/HeroSlider.svelte";
  import PushyPanel from "../components/PushyPanel.svelte";
  import ModalLogin from "../components/ModalLogin.svelte";
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
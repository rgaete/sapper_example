<script>
  import Carousel from "@beyonk/svelte-carousel";
  import { ChevronLeftIcon, ChevronRightIcon } from "svelte-feather-icons";
</script>

<style>
  main {
    height: 75vh;
  }
</style>

<div class="custom-content">
  <div class="site-content">
    <div class="container">
      <div class="row">
        <div class="content col-md-12">
          <div class="card card--clean">
            <header class="card__header card__header--has-filter">
              <h4>Nuestros recuerdos</h4>
            </header>
            <div class="card__content">
              <Carousel>
                <span class="control" slot="left-control">
                  <ChevronLeftIcon />
                </span>
                <div class="slide-content">
                  <img
                    alt="Racing 1"
                    src="assets/images/gallery/racing1.png" />
                </div>
                <div class="slide-content">
                  <img
                    alt="segunda imagem"
                    src="assets/images/gallery/racing2.png" />
                </div>
                <div class="slide-content">
                  <img
                    alt="terceira imagem"
                    src="assets/images/gallery/racing3.png" />
                </div>
                <div class="slide-content">
                  <img
                    alt="quarta imagem"
                    src="assets/images/gallery/racing4.png" />
                </div>
                <div class="slide-content">
                  <img
                    alt="quinta imagem"
                    src="assets/images/gallery/racing5.png" />
                </div>
                <div class="slide-content">
                  <img
                    alt="quinta imagem"
                    src="assets/images/gallery/racing6.png" />
                </div>
                <span class="control" slot="right-control">
                  <ChevronRightIcon />
                </span>
              </Carousel>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

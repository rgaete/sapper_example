
<script>
  import Standings from "./Standings.svelte";
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
        <div class="content col-md-8">
          <div class="card card--clean">
            <header class="card__header card__header--has-filter">
              <h4>Noticias</h4>
              <ul class="category-filter category-filter--featured">
                <li class="category-filter__item">
                  <a
                    href="#"
                    class="category-filter__link category-filter__link--reset
                    category-filter__link--active">
                    Todas
                  </a>
                </li>
                <li class="category-filter__item">
                  <a
                    href="#"
                    class="category-filter__link"
                    data-category="posts__item--category-1">
                    Nuestro Equipo
                  </a>
                </li>
                <li class="category-filter__item">
                  <a
                    href="#"
                    class="category-filter__link"
                    data-category="posts__item--category-3">
                    La Liga
                  </a>
                </li>
              </ul>
            </header>
            <div class="card__content">
              <div
                class="slick posts posts--slider-featured posts-slider
                posts-slider--center">
                <div class="posts__item posts__item--category-1">
                  <a href="#" class="posts__link-wrapper">
                    <div class="posts__thumb">
                      <img
                        src="assets/images/soccer/samples/post-slide7.jpg"
                        alt="" />
                    </div>
                    <div class="posts__inner">
                      <div class="posts__cat">
                        <span class="label posts__cat-label">
                          Nuestro Equipo
                        </span>
                      </div>
                      <h3 class="posts__title">
                        La Historia de
                        <span class="posts__title-higlight">Racing</span>
                        Dueños de una pasión
                      </h3>
                      <div class="post-author">
                        <div class="post-author__avatar">
                          <img
                            src="assets/images/samples/avatar-4.jpg"
                            alt="Post Author Avatar" />
                        </div>
                        <div class="post-author__info">
                          <h4 class="post-author__name">Nicolas Apraiz</h4>
                          <time datetime="2017-08-28" class="posts__date">
                            30 de Junio, 2018
                          </time>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="sidebar" class="sidebar col-md-4">
          <Standings />
          <div class="SocialLinks">
            <aside
              class="widget widget--sidebar widget-social
              widget-social--condensed">
              <a
                href="#"
                class="btn-social-counter btn-social-counter--fb"
                target="_blank">
                <div class="btn-social-counter__icon">
                  <i class="fa fa-facebook" />
                </div>
                <h6 class="btn-social-counter__title">
                  Danos like en Facebook
                </h6>
                <span class="btn-social-counter__count">
                  <span class="btn-social-counter__count-num" />
                  Likes
                </span>
                <span class="btn-social-counter__add-icon" />
              </a>
              <a
                href="#"
                class="btn-social-counter btn-social-counter--twitter"
                target="_blank">
                <div class="btn-social-counter__icon">
                  <i class="fa fa-twitter" />
                </div>
                <h6 class="btn-social-counter__title">Síguenos en Twitter</h6>
                <span class="btn-social-counter__count">
                  <span class="btn-social-counter__count-num" />
                  Seguidores
                </span>
                <span class="btn-social-counter__add-icon" />
              </a>
              <a
                href="#"
                class="btn-social-counter btn-social-counter--rss"
                target="_blank">
                <div class="btn-social-counter__icon">
                  <i class="fa fa-rss" />
                </div>
                <h6 class="btn-social-counter__title">
                  Sigue nuestras notícias
                </h6>
                <span class="btn-social-counter__count">
                  <span class="btn-social-counter__count-num">840</span>
                  Seguidores
                </span>
                <span class="btn-social-counter__add-icon" />
              </a>
            </aside>
          </div>
          <div class="next-match" />
          <div
            class="modal fade"
            id="modal-login-register-tabs"
            tabindex="-1"
            role="dialog">
            <div
              class="modal-dialog modal-lg modal--login modal--login-only"
              role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <button
                    type="button"
                    class="close"
                    data-dismiss="modal"
                    aria-label="Close">
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div class="modal-body">
                  <div class="modal-account-holder">
                    <div class="modal-account__item modal-account__item--logo">
                      <p class="modal-account__item-register-txt">
                        Don’t have an account?
                        <a href="#">Register Now</a>
                        and enjoy all our benefits!
                      </p>
                    </div>
                    <div class="modal-account__item">
                      <div class="tab-content">
                        <div
                          role="tabpanel"
                          class="tab-pane fade show active"
                          id="tab-login">
                          <form action="#" class="modal-form">
                            <h5>Login to your account</h5>
                            <div class="form-group">
                              <input
                                type="email"
                                class="form-control"
                                placeholder="Enter your email address..." />
                            </div>
                            <div class="form-group">
                              <input
                                type="password"
                                class="form-control"
                                placeholder="Enter your password..." />
                            </div>
                            <div class="form-group form-group--pass-reminder">
                              <label class="checkbox checkbox-inline">
                                <input
                                  type="checkbox"
                                  id="inlineCheckbox1"
                                  value="option1"
                                  checked="" />
                                Remember Me
                                <span class="checkbox-indicator" />
                              </label>
                              <a href="#">Forgot your password?</a>
                            </div>
                            <div class="form-group form-group--submit">
                              <a
                                href="_soccer_shop-account.html"
                                class="btn btn-primary-inverse btn-block">
                                Enter to your account
                              </a>
                            </div>
                            <div class="modal-form--social">
                              <h6>or Login with your social profile:</h6>
                              <ul
                                class="social-links social-links--btn
                                text-center">
                                <li class="social-links__item">
                                  <a
                                    href="#"
                                    class="social-links__link
                                    social-links__link--lg
                                    social-links__link--fb">
                                    <i class="fa fa-facebook" />
                                  </a>
                                </li>
                                <li class="social-links__item">
                                  <a
                                    href="#"
                                    class="social-links__link
                                    social-links__link--lg
                                    social-links__link--twitter">
                                    <i class="fa fa-twitter" />
                                  </a>
                                </li>
                                <li class="social-links__item">
                                  <a
                                    href="#"
                                    class="social-links__link
                                    social-links__link--lg
                                    social-links__link--gplus">
                                    <i class="fa fa-google-plus" />
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </form>
                        </div>
                        <div
                          role="tabpanel"
                          class="tab-pane fade"
                          id="tab-register">
                          <form action="#" class="modal-form">
                            <h5>Register Now!</h5>
                            <div class="form-group">
                              <input
                                type="email"
                                class="form-control"
                                placeholder="Enter your email address..." />
                            </div>
                            <div class="form-group">
                              <input
                                type="password"
                                class="form-control"
                                placeholder="Enter your password..." />
                            </div>
                            <div class="form-group">
                              <input
                                type="password"
                                class="form-control"
                                placeholder="Repeat your password..." />
                            </div>
                            <div class="form-group form-group--submit">
                              <a
                                href="_soccer_shop-account.html"
                                class="btn btn-success btn-block">
                                Create Your Account
                              </a>
                            </div>
                            <div class="modal-form--note">
                              You’ll receive a confirmation email in your inbox
                              with a link to activate your account.
                            </div>
                          </form>
                        </div>
                      </div>
                      <div class="nav-tabs-login-wrapper">
                        <ul
                          class="nav nav-tabs nav-justified nav-tabs--login"
                          role="tablist">
                          <li class="nav-item">
                            <a
                              class="nav-link active"
                              href="#tab-login"
                              role="tab"
                              data-toggle="tab">
                              Login
                            </a>
                          </li>
                          <li class="nav-item">
                            <a
                              class="nav-link"
                              href="#tab-register"
                              role="tab"
                              data-toggle="tab">
                              Register
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

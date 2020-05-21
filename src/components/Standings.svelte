<script>
  const StangingData = {
    teams: [
      {
        name: "Flamigos",
        description: "Description",
        logo: "assets/images/logos/flamigos.png",
        logo_alt: "Flamigos",
        played_matches: 6,
        won_matches: 5,
        tied_matches: 0,
        lose_matches: 1,
        points: 15
      },
      {
        name: "Scratch",
        description: "Description",
        logo: "assets/images/logos/scratch.png",
        logo_alt: "Scratch",
        played_matches: 6,
        won_matches: 4,
        tied_matches: 0,
        lose_matches: 2,
        points: 12
      },
      {
        name: "TEI",
        description: "Description",
        logo: "assets/images/logos/tei.png",
        logo_alt: "TEI",
        played_matches: 6,
        won_matches: 3,
        tied_matches: 1,
        lose_matches: 2,
        points: 10
      },
      {
        name: "Shangai NC",
        description: "Description",
        logo: "assets/images/logos/shangai.png",
        logo_alt: "Shangai NC",
        played_matches: 6,
        won_matches: 3,
        tied_matches: 1,
        lose_matches: 2,
        points: 10
      },
      {
        name: "All In",
        description: "Description",
        logo: "assets/images/logos/allin.png",
        logo_alt: "TEI",
        played_matches: 6,
        won_matches: 1,
        tied_matches: 3,
        lose_matches: 2,
        points: 6
      },
      {
        name: "Racing",
        description: "Description",
        logo: "assets/images/logos/racing.png",
        logo_alt: "Racing",
        played_matches: 6,
        won_matches: 1,
        tied_matches: 1,
        lose_matches: 4,
        points: 4
      },
      {
        name: "Juventud Charrua",
        description: "Description",
        logo: "assets/images/logos/charrua.png",
        logo_alt: "Juventud Charrua",
        played_matches: 6,
        won_matches: 1,
        tied_matches: 0,
        lose_matches: 5,
        points: 3
      }
    ]
  };
</script>

<div class="standings">
  <aside class="widget card widget--sidebar widget-standings">
    <div class="widget__title card__header card__header--has-btn">
      <h4>Liga Lipangue - Senior Clausura 2019</h4>
      <a
        href="#"
        class="btn btn-default btn-outline btn-xs card-header__button">
        Estadísticas
      </a>
    </div>
    <div class="widget__content card__content">
      <div class="table-responsive">
        <table class="table table-hover table-standings">
          <thead>
            <tr>
              <th>Posición</th>
              <th>J</th>
              <th>G</th>
              <th>E</th>
              <th>P</th>
              <th>PTS</th>
            </tr>
          </thead>
          <tbody>
            {#each StangingData.teams as team}
              <tr>
                <td>
                  <div class="team-meta">
                    <figure class="team-meta__logo">
                      <img
                        src={team.logo}
                        alt={team.logo_alt} />
                    </figure>
                    <div class="team-meta__info">
                      <h6 class="team-meta__name">{team.name}</h6>
                    </div>
                  </div>
                </td>
                <td>{team.played_matches}</td>
                <td>{team.won_matches}</td>
                <td>{team.tied_matches}</td>
                <td>{team.lose_matches}</td>
                <td>{team.points}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </aside>
</div>

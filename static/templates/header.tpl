<nav class="navbar navbar-dark bg-dark justify-content-between">
	<div class="float-left">
		<i class="fas fa-angle-left" style="display: none;"></i>
		<i class="fas fa-home"></i>
		<a class="navbar-brand" href="#">{{ title }}</a> <span>v{{ version }}</span>
	</div>
	<div>
		<div id="search">
			<i class="fas fa-search"></i>
			<i class="fas fa-times" style="display: none;"></i>
			<input type="text" placeholder="{{ trans 'search.placeholder' }}" />
		</div>

		<i class="fas fa-search" style="display: none;"></i>
		<i class="fas fa-times" style="display: none;"></i>

		<div class="dropdown langs">
			<a href="#" class="dropdown-toggle" id="droplangs" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><img src="images/flags/{{ lang }}.png" /></a>
			<div class="dropdown-menu" aria-labelledby="droplangs">
{{# each langs }}
				<a href="#" class="dropdown-item" data-item="{{ this }}">
					<img src="images/flags/{{ this }}.png" />
				</a>
{{/ each }}
			</div>
		</div>

		<i class="fas fa-cog"></i>
	</div>
</nav>

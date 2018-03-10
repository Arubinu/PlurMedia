<div class="float-left">
{{# if ( eq type 'infos' ) }}
	{{ infos.name }}
{{ else }}
	<div class="sort">{{ trans 'bartop.all' }}</div>
	<div class="sort">{{ trans 'bartop.movies' }}</div>
	<div class="sort">{{ trans 'bartop.title' }}</div>
	<span class="badge badge-secondary">{{ size }}</span>
{{/ if }}
</div>
<div class="float-right">
{{# if ( eq type 'infos' ) }}
	<i class="fas fa-play hover"></i>
	<i class="fas fa-share-square hover"></i>
{{/ if }}
	<div class="separator"></div>
{{# if ( eq type 'infos' ) }}
	<i class="fas fa-image hover"></i>
{{ else }}
	<input type="range" min="1" max="4" class="zoom" />
	<i class="fas fa-th"></i>
	<div class="grid"></div>
{{/ if }}
</div>

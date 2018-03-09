{{# if ( eq type 'categories' ) }}
	{{# each list as |category| }}
		<div class="category" data-id="{{ category.id }}">
			<i class="fas fa-{{ category.type }}"></i>
			<div class="title">{{ category.name }}</div>
		</div>
	{{/ each }}
{{ else if ( eq type 'medias' ) }}
	{{# each list as |media| }}
		<div class="media" data-id="{{ media.id }}" data-category="{{ media.category }}">
			<div class="poster">
				<div>
					<i class="fas fa-info"></i>
					<div><div><div><i class="fas fa-play"></i></div></div></div>
				</div>
				<img src="assets/{{ assets 'medias' media.id '.jpg' }}" />
			</div>
			<div class="title">{{ media.name }}</div>
			{{# if ( not ( date-null media.date ) ) }}<div class="date">{{ dateFormat media.date format="yy" }}</div>{{/ if }}
		</div>
	{{/ each }}
{{ else }}
	<div class="infos" data-id="{{ infos.category }}">
		<div class="banner" style="background-image: url( 'assets/{{ assets 'banners' infos.id '.jpg' }}' )"></div>
		<div>
			<div class="content">
				<div class="poster">
					<div>
						<div><div><div><i class="fas fa-play"></i></div></div></div>
					</div>
					<img src="assets/{{ assets 'medias' infos.id '.jpg' }}" />
				</div>
				<h1>{{ infos.name }}</h1>
				<h5>{{ dateFormat infos.date format="yy"  }}</h5>
				<hr />
				<table class="space-top">
					<tbody>
						{{# if infos.directed_by }}
						<tr>
							<th>Dirigé par</th>
							<td>{{ infos.directed_by }}</td>
						</tr>
						{{/ if }}
						{{# if infos.written_by }}
						<tr>
							<th>Écrit par</th>
							<td>{{ infos.written_by }}</td>
						</tr>
						{{/ if }}
						{{# if infos.studio }}
						<tr>
							<th>Studio</th>
							<td>{{ infos.studio }}</td>
						</tr>
						{{/ if }}
					</tbody>
				</table>
				<div class="space-top">{{ infos.description }}</div>
				{{# if infos.actors }}
				<div class="actors">
					<h5>Acteurs</h5>
					<div class="list">
						{{# each infos.actors as |actor| }}
						<div>
							<div class="photo" style="background-image: url( 'assets/{{ assets 'actors' ( array-get 0 actor ) '.jpg' }}' );"></div>
							<div class="big">{{# each ( split ( array-get 0 actor ) ' ' ) as |word| }}{{ array-get 0 ( split word '' ) }}{{/ each }}</div>
							<div>{{ array-get 0 actor }}</div>
							<div class="character">{{ or ( array-get 1 actor ) ' ' }}</div>
						</div>
						{{/ each }}
					</div>
				</div>
				{{/ if }}
			</div>
		</div>
	</div>
{{/ if }}
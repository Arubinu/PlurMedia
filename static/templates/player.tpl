<div class="top">
	<div class="float-left">
		<i class="fas fa-angle-down hover"></i>
	</div>
	<div class="float-right">
		<i class="fas fa-share-square hover"></i>
		<i class="fas fa-exchange-alt hover"></i>
	</div>
</div>
<div class="bottom">
	<div class="left">
		<div class="title">{{ name }}</div>
		{{# if ( not ( date-null date ) ) }}<div class="date">{{ dateFormat date format="yy" }}</div>{{/ if }}
	</div>
	<div class="text-center">
		<div class="time">0:00 / 0:00:00</div>
		<i class="fas fa-step-backward disable"></i>
		<i class="fas fa-backward hover"></i>
		<i class="fas fa-play hover play fa-2x"></i>
		<i class="fas fa-forward hover"></i>
		<i class="fas fa-step-forward disable"></i>
	</div>
	<div class="right">
		<i class="fas fa-volume-up hover"></i>
		<input type="range" min="0" max="100" value="100" class="volume" />
		<i class="fas fa-times-circle hover"></i>
	</div>
</div>

/**
 * Copyright (c) 2016 - 2017, CKSource - Frederico Knabben. All rights reserved.
 */

import ButtonView from '../../../button/buttonview';
import toUnit from '@ckeditor/ckeditor5-utils/src/dom/tounit';
import '../../../../theme/components/toolbar/blocktoolbar.css';

const toPx = toUnit( 'px' );

/**
 * The block button view class.
 *
 * @extends {module:ui/button/buttonview~ButtonView}
 */
export default class BlockButtonView extends ButtonView {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * Top offset.
		 *
		 * @member {Number} #top
		 */
		this.set( 'top', 0 );

		/**
		 * Left offset.
		 *
		 * @member {Number} #left
		 */
		this.set( 'left', 0 );

		this.extendTemplate( {
			attributes: {
				class: 'ck-block-toolbar-button',
				style: {
					top: bind.to( 'top', val => toPx( val ) ),
					left: bind.to( 'left', val => toPx( val ) ),
				}
			}
		} );
	}
}

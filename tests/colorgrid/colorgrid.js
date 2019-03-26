/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals Event */

import ColorGrid from './../../src/colorgrid/colorgrid';
import ColorTile from '../../src/colorgrid/colortile';
import ViewCollection from '../../src/viewcollection';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import FocusCycler from '../../src/focuscycler';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'ColorGrid', () => {
	let locale, view;

	const colorDefinitions = [
		{
			color: '#000',
			label: 'Black',
			options: {
				hasBorder: false
			}
		},
		{
			color: 'rgb(255, 255, 255)',
			label: 'White',
			options: {
				hasBorder: true
			}
		},
		{
			color: 'red',
			label: 'Red',
			options: {
				hasBorder: false
			}
		}
	];

	beforeEach( () => {
		locale = { t() {} };
		view = new ColorGrid( locale, { colorDefinitions } );
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	testUtils.createSinonSandbox();

	describe( 'constructor()', () => {
		it( 'creates element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-color-grid' ) ).to.be.true;
		} );

		it( 'uses the options#columns to control the grid', () => {
			const view = new ColorGrid( locale, { columns: 3 } );
			view.render();

			expect( view.element.style.gridTemplateColumns ).to.equal( '1fr 1fr 1fr' );

			view.destroy();
		} );

		it( 'creates the view without provided color definitions', () => {
			const view = new ColorGrid( locale );
			view.render();

			expect( view.items ).to.have.length( 0 );

			view.destroy();
		} );

		it( 'creates view collection with children', () => {
			expect( view.items ).to.be.instanceOf( ViewCollection );
		} );

		it( 'creates focus tracker', () => {
			expect( view.focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		it( 'creates keystroke handler', () => {
			expect( view.keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );

		it( 'creates focus cycler', () => {
			expect( view._focusCycler ).to.be.instanceOf( FocusCycler );
		} );

		describe( 'add colors from definition as child items', () => {
			it( 'has proper number of elements', () => {
				expect( view.items.length ).to.equal( 3 );
			} );

			colorDefinitions.forEach( ( color, index ) => {
				describe( 'child items has proper attributes', () => {
					it( `for (index: ${ index }, color: ${ color.color }) child`, () => {
						const colorTile = view.items.get( index );

						expect( colorTile ).to.be.instanceOf( ColorTile );
						expect( colorTile.color ).to.equal( color.color );
					} );
				} );
			} );
		} );
	} );

	describe( 'execute()', () => {
		it( 'fires event for rendered tiles', () => {
			const spy = sinon.spy();
			const firstTile = view.items.first;

			view.on( 'execute', spy );

			firstTile.isEnabled = true;

			firstTile.element.dispatchEvent( new Event( 'click' ) );
			sinon.assert.callCount( spy, 1 );

			firstTile.isEnabled = false;

			firstTile.element.dispatchEvent( new Event( 'click' ) );
			sinon.assert.callCount( spy, 1 );
		} );
	} );

	describe( 'focus', () => {
		it( 'focuses the tile in DOM', () => {
			const spy = sinon.spy( view.items.first, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );

			view.items.clear();
			view.focus();

			expect( view.items.length ).to.equal( 0 );
			sinon.assert.calledOnce( spy );
		} );

		it( 'focuses last the tile in DOM', () => {
			const spy = sinon.spy( view.items.last, 'focus' );

			view.focusLast();

			sinon.assert.calledOnce( spy );

			view.items.clear();
			view.focusLast();

			expect( view.items.length ).to.equal( 0 );
			sinon.assert.calledOnce( spy );
		} );

		describe( 'update elements in focus tracker', () => {
			it( 'adding new element', () => {
				const spy = sinon.spy( view.focusTracker, 'add' );

				const colorTile = new ColorTile();
				colorTile.set( {
					color: 'yellow',
					label: 'Yellow',
					tooltip: true,
					options: {
						hasBorder: false
					}
				} );
				view.items.add( colorTile );

				expect( view.items.length ).to.equal( 4 );
				sinon.assert.calledOnce( spy );
			} );

			it( 'removes element', () => {
				const spy = sinon.spy( view.focusTracker, 'remove' );

				view.items.remove( view.items.length - 1 );

				expect( view.items.length ).to.equal( 2 );
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );
} );

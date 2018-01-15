/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, Event */

import Model from '../../../src/model';
import createButtonDropdown from '../../../src/dropdown/button/createbuttondropdown';

import ButtonView from '../../../src/button/buttonview';
import ToolbarView from '../../../src/toolbar/toolbarview';

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

describe( 'createButtonDropdown', () => {
	let view, model, locale, buttons;

	beforeEach( () => {
		locale = { t() {} };
		buttons = [ '<svg>foo</svg>', '<svg>bar</svg>' ].map( icon => {
			const button = new ButtonView();
			button.icon = icon;

			return button;
		} );

		model = new Model( {
			isVertical: true,
			buttons
		} );

		view = createButtonDropdown( model, locale );
		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
	} );

	describe( 'constructor()', () => {
		it( 'sets view#locale', () => {
			expect( view.locale ).to.equal( locale );
		} );

		describe( 'view#toolbarView', () => {
			it( 'is created', () => {
				const panelChildren = view.panelView.children;

				expect( panelChildren ).to.have.length( 1 );
				expect( panelChildren.get( 0 ) ).to.equal( view.toolbarView );
				expect( view.toolbarView ).to.be.instanceof( ToolbarView );
			} );

			it( 'delegates view.toolbarView#execute to the view', done => {
				view.on( 'execute', evt => {
					expect( evt.source ).to.equal( view.toolbarView.items.get( 0 ) );
					expect( evt.path ).to.deep.equal( [ view.toolbarView.items.get( 0 ), view ] );

					done();
				} );

				view.toolbarView.items.get( 0 ).fire( 'execute' );
			} );

			it( 'reacts on model#isVertical', () => {
				model.isVertical = false;
				expect( view.toolbarView.isVertical ).to.be.false;

				model.isVertical = true;
				expect( view.toolbarView.isVertical ).to.be.true;
			} );

			it( 'reacts on model#toolbarClassName', () => {
				expect( view.toolbarView.className ).to.be.undefined;

				model.set( 'toolbarClassName', 'foo' );
				expect( view.toolbarView.className ).to.equal( 'foo' );
			} );
		} );

		it( 'changes view#isOpen on view#execute', () => {
			view.isOpen = true;

			view.fire( 'execute' );
			expect( view.isOpen ).to.be.false;

			view.fire( 'execute' );
			expect( view.isOpen ).to.be.false;
		} );

		it( 'listens to view#isOpen and reacts to DOM events (valid target)', () => {
			// Open the dropdown.
			view.isOpen = true;

			// Fire event from outside of the dropdown.
			document.body.dispatchEvent( new Event( 'click', {
				bubbles: true
			} ) );

			// Closed the dropdown.
			expect( view.isOpen ).to.be.false;

			// Fire event from outside of the dropdown.
			document.body.dispatchEvent( new Event( 'click', {
				bubbles: true
			} ) );

			// Dropdown is still closed.
			expect( view.isOpen ).to.be.false;
		} );

		it( 'listens to view#isOpen and reacts to DOM events (invalid target)', () => {
			// Open the dropdown.
			view.isOpen = true;

			// Event from view.element should be discarded.
			view.element.dispatchEvent( new Event( 'click', {
				bubbles: true
			} ) );

			// Dropdown is still open.
			expect( view.isOpen ).to.be.true;

			// Event from within view.element should be discarded.
			const child = document.createElement( 'div' );
			view.element.appendChild( child );

			child.dispatchEvent( new Event( 'click', {
				bubbles: true
			} ) );

			// Dropdown is still open.
			expect( view.isOpen ).to.be.true;
		} );

		describe( 'activates keyboard navigation for the dropdown', () => {
			it( 'so "arrowdown" focuses the #toolbarView if dropdown is open', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowdown,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};
				const spy = sinon.spy( view.toolbarView, 'focus' );

				view.isOpen = false;
				view.keystrokes.press( keyEvtData );
				sinon.assert.notCalled( spy );

				view.isOpen = true;
				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( spy );
			} );

			it( 'so "arrowup" focuses the last #item in #toolbarView if dropdown is open', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowup,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};
				const spy = sinon.spy( view.toolbarView, 'focusLast' );

				view.isOpen = false;
				view.keystrokes.press( keyEvtData );
				sinon.assert.notCalled( spy );

				view.isOpen = true;
				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( spy );
			} );
		} );

		describe( 'icon', () => {
			it( 'should be set to first button\'s icon if no defaultIcon defined', () => {
				expect( view.buttonView.icon ).to.equal( view.toolbarView.items.get( 0 ).icon );
			} );

			it( 'should be bound to first button that is on', () => {
				view.toolbarView.items.get( 1 ).isOn = true;

				expect( view.buttonView.icon ).to.equal( view.toolbarView.items.get( 1 ).icon );

				view.toolbarView.items.get( 0 ).isOn = true;
				view.toolbarView.items.get( 1 ).isOn = false;

				expect( view.buttonView.icon ).to.equal( view.toolbarView.items.get( 0 ).icon );
			} );

			it( 'should be set to defaultIcon if defined and on button is on', () => {
				const model = new Model( {
					defaultIcon: '<svg>baz</svg>',
					buttons
				} );

				view = createButtonDropdown( model, locale );
				view.render();

				expect( view.buttonView.icon ).to.equal( '<svg>baz</svg>' );
			} );

			it( 'should not bind icons if staticIcon is set', () => {
				const model = new Model( {
					defaultIcon: '<svg>baz</svg>',
					staticIcon: true,
					buttons
				} );

				view = createButtonDropdown( model, locale );
				view.render();

				expect( view.buttonView.icon ).to.equal( '<svg>baz</svg>' );
				view.toolbarView.items.get( 1 ).isOn = true;

				expect( view.buttonView.icon ).to.equal( '<svg>baz</svg>' );
			} );
		} );
	} );
} );
/**
 * Monday.com API Client for Vehicle Retirement Portal
 */

export class MondayApi {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.monday.com/v2';
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Execute GraphQL query
   */
  async query(query, variables = {}) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(`Monday.com API error: ${data.errors[0].message}`);
      }

      return data.data;
    } catch (error) {
      console.error('Monday API query error:', error);
      throw error;
    }
  }

  /**
   * Search for items in a board
   */
  async searchBoardItems(options) {
    const { boardId, searchTerm } = options;

    const query = `
      query searchItems($boardId: ID!, $term: String!) {
        items_page(query_params: {rules: [{column_id: "name", compare_value: $term}]}, limit: 1) {
          items {
            id
            name
          }
        }
      }
    `;

    const data = await this.query(query, {
      boardId: boardId.toString(),
      term: searchTerm,
    });

    return data.items_page.items;
  }

  /**
   * Get detailed item information
   */
  async getItemDetails(itemId, boardId) {
    const query = `
      query getItem($itemId: ID!) {
        items(ids: [$itemId]) {
          id
          name
          board {
            columns {
              id
              title
              type
            }
          }
          column_values {
            id
            text
            type
            value
          }
        }
      }
    `;

    const data = await this.query(query, {
      itemId: itemId.toString(),
    });

    if (!data.items || data.items.length === 0) {
      throw new Error('Item not found');
    }

    return data.items[0];
  }

  /**
   * Create item in a board
   */
  async createBoardItem(boardId, itemData) {
    const query = `
      mutation createItem($boardId: ID!, $name: String!, $columnValues: JSON!) {
        create_item(board_id: $boardId, item_name: $name, column_values: $columnValues) {
          id
          name
        }
      }
    `;

    const columnValues = JSON.stringify(itemData.columnValues);

    const data = await this.query(query, {
      boardId: boardId.toString(),
      name: itemData.name,
      columnValues: columnValues,
    });

    return data.create_item;
  }

  /**
   * Get all items from a board
   */
  async getBoardItems(boardId, limit = 25) {
    const query = `
      query getItems($boardId: ID!, $limit: Int!) {
        boards(ids: [$boardId]) {
          items_page(limit: $limit) {
            items {
              id
              name
              column_values {
                id
                text
                type
              }
            }
          }
        }
      }
    `;

    const data = await this.query(query, {
      boardId: boardId.toString(),
      limit,
    });

    return data.boards[0].items_page.items;
  }

  /**
   * Update item column values
   */
  async updateItemColumnValues(itemId, columnValues) {
    const query = `
      mutation updateItem($itemId: ID!, $columnValues: JSON!) {
        change_multiple_column_values(item_id: $itemId, column_values: $columnValues) {
          id
          name
        }
      }
    `;

    const cvString = JSON.stringify(columnValues);

    const data = await this.query(query, {
      itemId: itemId.toString(),
      columnValues: cvString,
    });

    return data.change_multiple_column_values;
  }

  /**
   * Get managers from a board (for dropdown population)
   */
  async getManagersList() {
    // Static list for now - could be expanded to query from monday
    return [
      'Josh Emerson',
      'Jay Brooks',
      'Sloane Strus',
      'Mike Battle',
      'Charles Runyon',
      'Derrick Boodhoo',
      'Roger Runyon',
      'Eddie Thomas',
      'John Barnett',
      'Justin Nichols',
    ];
  }

  /**
   * Get office locations
   */
  async getOfficeLocations() {
    return [
      'Baltimore, MD',
      'Bowie, MD',
      'Salisbury, MD',
      'White Plains, MD',
      'Williamsport, MD',
      'Manassas, VA',
      'Richmond, VA',
      'Dover, DE',
      'Brentwood, TN',
      'Orem, UT',
    ];
  }
}

export default MondayApi;

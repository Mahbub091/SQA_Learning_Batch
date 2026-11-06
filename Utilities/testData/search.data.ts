import { compilePatterns, staticData } from './data.loader';
import { FakeDataProvider } from './FakeDataProvider';

export const searchData = {
  ...staticData.search,
  noResultTerm: FakeDataProvider.noResultTerm(),
  longString: FakeDataProvider.longString(),
};

export const searchMessages = compilePatterns(staticData.messages.search);

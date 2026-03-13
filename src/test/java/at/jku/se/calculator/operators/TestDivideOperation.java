package at.jku.se.calculator.operators;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;

import org.junit.Before;
import org.junit.Test;

/**
 * This test class performs tests for the {@link AddOperation} class.
 * 
 * @author Michael Vierhauser
 */
public class TestDivideOperation {

	private DivideOperation divide;

	@Before
	public void setup() {
		divide = new DivideOperation();
	}

	/**
	 * This test case tests the calculate method in the DivideOperation class.
	 * 
	 */
	@Test
	public void testCalculate() {
		String result = divide.calculate("6/2");
		assertEquals(3, Integer.parseInt(result));
	}

	/**
	 * This test case tests the calculate method in the DivideOperation class.
	 * 
	 */
	@Test
	public void testCalculate2() {
		String result = divide.calculate("10/2");
		assertEquals(5, Integer.parseInt(result));
	}

	/**
	 * This test case tests an illegal input for an {@link DivideOperation}. A String
	 * is entered instead of a number. An {@link IllegalArgumentException} should be
	 * thrown
	 * 
	 */
	@Test
	public void testCalculateException() {
		assertThrows(IllegalArgumentException.class, () -> divide.calculate("xyz/3"));
	}

	/**
	 * Tests that an invalid second operand throws an {@link IllegalArgumentException}.
	 */
	@Test
	public void testCalculateExceptionSecondOperand() {
		assertThrows(IllegalArgumentException.class, () -> divide.calculate("3/abc"));
	}

	/**
	 * Tests that a malformed input without a '/' sign throws an {@link IllegalArgumentException}.
	 */
	@Test
	public void testCalculateMalformedInput() {
		assertThrows(IllegalArgumentException.class, () -> divide.calculate("3-3"));
	}

}
